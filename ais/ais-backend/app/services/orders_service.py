from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import List, Dict, Any
import json
from datetime import datetime

from app.models.order import Order
from app.models.payment import Payment
from app.services.logging_service import logger
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse, OrderWithPayment

class OrderService:
    @staticmethod
    def get_all_orders(db: Session) -> List[OrderWithPayment]:
        """Получить все заказы с информацией о платежах"""
        try:
            # Запрашиваем все заказы
            orders = db.query(Order).all()
            result = []

            for order in orders:
                # Запрашиваем последний платеж для каждого заказа
                payment = db.query(Payment).filter(
                    Payment.order_id == order.id
                ).order_by(Payment.created_at.desc()).first()
                
                # Создаем словарь с данными заказа и платежа
                order_dict = {
                    "id": order.id,
                    "user_id": order.user_id,
                    "status": order.status,
                    "created_at": order.created_at,
                    "total_amount": order.total_amount,
                    "delivery_address": order.delivery_address,
                    "name": order.name,
                    "phone": order.phone,
                    "email": order.email,
                    "comment": order.comment,
                    "payment_method": order.payment_method,
                    "tracking_number": order.tracking_number,
                    "courier_name": order.courier_name,
                    "delivery_notes": order.delivery_notes,
                    "estimated_delivery": order.estimated_delivery,
                    "actual_delivery": order.actual_delivery,
                    "order_items": [],  # Пустой список для товаров
                    "payment": None,
                    "payment_status": None,
                    "transaction_id": None
                }
                
                # Если есть платеж, добавляем его данные
                if payment:
                    order_dict["payment"] = {
                        "id": payment.id,
                        "payment_status": payment.payment_status,
                        "payment_method": payment.payment_method,
                        "transaction_id": payment.transaction_id,
                        "created_at": payment.created_at
                    }
                    order_dict["payment_status"] = payment.payment_status
                    order_dict["transaction_id"] = payment.transaction_id
                
                result.append(order_dict)

            return result
        except Exception as e:
            logger.error(f"Ошибка при получении всех заказов: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов: {str(e)}")

    @staticmethod
    def get_order(order_id: int, db: Session) -> OrderWithPayment:
        """Получить детали заказа по ID"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")

        # Получаем последний платеж для этого заказа
        payment = db.query(Payment).filter(
            Payment.order_id == order.id
        ).order_by(Payment.created_at.desc()).first()

        # Создаем словарь с данными заказа и платежа
        order_dict = {
            "id": order.id,
            "user_id": order.user_id,
            "status": order.status,
            "created_at": order.created_at,
            "total_amount": order.total_amount,
            "delivery_address": order.delivery_address,
            "name": order.name,
            "phone": order.phone,
            "email": order.email,
            "comment": order.comment,
            "payment_method": order.payment_method,
            "tracking_number": order.tracking_number,
            "courier_name": order.courier_name,
            "delivery_notes": order.delivery_notes,
            "estimated_delivery": order.estimated_delivery,
            "actual_delivery": order.actual_delivery,
            "order_items": [],  # Пустой список для товаров
            "payment": None,
            "payment_status": None,
            "transaction_id": None
        }

        # Если есть платеж, добавляем его данные
        if payment:
            order_dict["payment"] = {
                "id": payment.id,
                "payment_status": payment.payment_status,
                "payment_method": payment.payment_method,
                "transaction_id": payment.transaction_id,
                "created_at": payment.created_at
            }
            order_dict["payment_status"] = payment.payment_status
            order_dict["transaction_id"] = payment.transaction_id

        return order_dict

    @staticmethod
    def update_order_status(order_id: int, status: str, db: Session) -> OrderWithPayment:
        """Обновить статус заказа"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")

        # Обновляем статус заказа
        order.status = status
        
        # Если статус доставлен, устанавливаем дату доставки
        if status == "delivered" and not order.actual_delivery:
            order.actual_delivery = datetime.utcnow()

        try:
            db.commit()
            return OrderService.get_order(order_id, db)
        except Exception as e:
            db.rollback()
            logger.error(f"Ошибка при обновлении статуса заказа: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при обновлении статуса заказа: {str(e)}")

    @staticmethod
    def update_order_details(order_id: int, data: dict, db: Session) -> OrderWithPayment:
        """Обновить детали заказа"""
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Заказ не найден")

        # Обновляем поля заказа
        for key, value in data.items():
            if hasattr(order, key):
                setattr(order, key, value)

        try:
            db.commit()
            return OrderService.get_order(order_id, db)
        except Exception as e:
            db.rollback()
            logger.error(f"Ошибка при обновлении данных заказа: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при обновлении данных заказа: {str(e)}")

    @staticmethod
    def create_new_order(order_data: OrderCreate, db: Session) -> OrderResponse:
        """Создать новый заказ"""
        # Создаем новый заказ
        new_order = Order(
            user_id=order_data.user_id,
            status="pending",
            total_amount=order_data.total_amount,
            delivery_address=order_data.delivery_address,
            name=order_data.name,
            phone=order_data.phone,
            email=order_data.email,
            comment=order_data.comment,
            payment_method=order_data.payment_method,
            created_at=datetime.utcnow()
        )

        try:
            db.add(new_order)
            db.commit()
            db.refresh(new_order)
            
            # Возвращаем созданный заказ
            return OrderResponse(
                id=new_order.id,
                user_id=new_order.user_id,
                status=new_order.status,
                created_at=new_order.created_at,
                total_amount=new_order.total_amount,
                delivery_address=new_order.delivery_address,
                name=new_order.name,
                phone=new_order.phone,
                email=new_order.email,
                comment=new_order.comment,
                payment_method=new_order.payment_method
            )
        except Exception as e:
            db.rollback()
            logger.error(f"Ошибка при создании нового заказа: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при создании заказа: {str(e)}")

    @staticmethod
    def get_orders_for_user(user_id: int, db: Session) -> List[OrderResponse]:
        """Получить заказы пользователя"""
        try:
            orders = db.query(Order).filter(Order.user_id == user_id).all()
            return [
                OrderResponse(
                    id=order.id,
                    user_id=order.user_id,
                    status=order.status,
                    created_at=order.created_at,
                    total_amount=order.total_amount,
                    delivery_address=order.delivery_address,
                    name=order.name,
                    phone=order.phone,
                    email=order.email,
                    comment=order.comment,
                    payment_method=order.payment_method,
                    tracking_number=order.tracking_number,
                    courier_name=order.courier_name,
                    delivery_notes=order.delivery_notes,
                    estimated_delivery=order.estimated_delivery,
                    actual_delivery=order.actual_delivery
                )
                for order in orders
            ]
        except Exception as e:
            logger.error(f"Ошибка при получении заказов пользователя {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов пользователя: {str(e)}")

    @staticmethod
    def get_orders_with_status(status: str, db: Session) -> List[OrderWithPayment]:
        """Получить заказы по статусу"""
        try:
            orders = db.query(Order).filter(Order.status == status).all()
            result = []
            
            for order in orders:
                result.append(OrderService.get_order(order.id, db))
                
            return result
        except Exception as e:
            logger.error(f"Ошибка при получении заказов со статусом {status}: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при получении заказов по статусу: {str(e)}")

    @staticmethod
    def get_orders_statistics(db: Session) -> Dict[str, Dict[str, Any]]:
        """Получить статистику по заказам"""
        try:
            orders = db.query(Order).all()
            
            # Статистика по статусам
            stats = {}
            payment_stats = {}
            total = len(orders)
            
            for order in orders:
                # Статистика по статусам заказа
                if order.status not in stats:
                    stats[order.status] = 0
                stats[order.status] += 1
                
                # Находим последний платеж для заказа
                payment = db.query(Payment).filter(
                    Payment.order_id == order.id
                ).order_by(Payment.created_at.desc()).first()
                
                # Статистика по статусам платежей
                if payment:
                    if payment.payment_status not in payment_stats:
                        payment_stats[payment.payment_status] = 0
                    payment_stats[payment.payment_status] += 1
                else:
                    if "pending" not in payment_stats:
                        payment_stats["pending"] = 0
                    payment_stats["pending"] += 1
            
            return {
                "status": stats,
                "payment": payment_stats,
                "total": total
            }
        except Exception as e:
            logger.error(f"Ошибка при получении статистики заказов: {e}")
            raise HTTPException(status_code=500, detail=f"Ошибка при получении статистики: {str(e)}")