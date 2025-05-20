import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Configure logging
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Get database URL with appropriate default
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ais.db")

logger.info(f"Connecting to database using URL type: {DATABASE_URL.split(':')[0]}")

# Configure database connection
try:
    # Special configuration for SQLite
    if DATABASE_URL.startswith("sqlite"):
        engine = create_engine(
            DATABASE_URL, connect_args={"check_same_thread": False}
        )
        logger.info("SQLite connection configured with check_same_thread=False")
    # PostgreSQL configuration
    elif DATABASE_URL.startswith("postgresql"):
        # Add connection pooling options for PostgreSQL
        engine = create_engine(
            DATABASE_URL,
            pool_size=5,  # Default number of connections to keep open
            max_overflow=10,  # Allow up to 10 additional connections when needed
            pool_timeout=30,  # Wait up to 30 seconds for a connection
            pool_recycle=1800,  # Recycle connections after 30 minutes
            pool_pre_ping=True,  # Verify connection is still alive before using it
        )
        logger.info("PostgreSQL connection configured with connection pooling")
    # Default configuration for other databases
    else:
        engine = create_engine(DATABASE_URL)
        logger.info(f"Database connection configured for {DATABASE_URL.split(':')[0]}")

    # Test the connection
    with engine.connect() as conn:
        conn.execute("SELECT 1")
        logger.info("✅ Database connection successful")

except Exception as e:
    logger.error(f"❌ Error connecting to database: {e}")
    # Re-raise but with more context
    raise ConnectionError(f"Failed to connect to database: {e}") from e

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


# Database dependency for FastAPI
def get_db():
    """
    Database dependency to be used with FastAPI Depends.
    Creates a new database session and ensures it's closed after use.

    Usage:
    @app.get("/items/")
    def read_items(db: Session = Depends(get_db)):
        items = db.query(Item).all()
        return items
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Context manager for database sessions
class DatabaseSession:
    """
    Context manager for database sessions.

    Usage:
    with DatabaseSession() as db:
        items = db.query(Item).all()
    """

    def __enter__(self):
        self.db = SessionLocal()
        return self.db

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db.close()