from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from django.utils import timezone


ACADEMY_TIMEZONE = ZoneInfo("Asia/Colombo")
DAY_MAP = {
    'MON': 0,
    'TUE': 1,
    'WED': 2,
    'THU': 3,
    'FRI': 4,
    'SAT': 5,
    'SUN': 6,
}
def academy_now():
    return timezone.now().astimezone(ACADEMY_TIMEZONE)


def batch_is_scheduled_for_date(batch, target_date):
    if batch.batch_type == 'ONE_TIME':
        return batch.exact_date == target_date
    if not batch.schedule_day:
        return False
    return DAY_MAP.get(batch.schedule_day) == target_date.weekday()


def get_batch_attendance_window(batch, reference_dt=None, target_date=None):
    current_dt = reference_dt or academy_now()
    target_date = target_date or current_dt.date()

    if not batch_is_scheduled_for_date(batch, target_date):
        return {
            'status': 'UNSCHEDULED',
            'can_record': False,
            'message': 'This class is not scheduled for today.',
            'opens_at': None,
            'closes_at': None,
            'seconds_until_open': None,
        }

    class_start = datetime.combine(target_date, batch.start_time, tzinfo=ACADEMY_TIMEZONE)
    attendance_open_at = class_start
    attendance_close_at = class_start + timedelta(hours=24)

    if current_dt < attendance_open_at:
        seconds_until_open = int((attendance_open_at - current_dt).total_seconds())
        return {
            'status': 'BEFORE_WINDOW',
            'can_record': False,
            'message': 'Attendance opens when the class starts and stays open for 24 hours.',
            'opens_at': attendance_open_at,
            'closes_at': attendance_close_at,
            'seconds_until_open': max(seconds_until_open, 0),
        }

    if current_dt > attendance_close_at:
        return {
            'status': 'EXPIRED',
            'can_record': False,
            'message': 'Attendance must be recorded within 24 hours from the class start time.',
            'opens_at': attendance_open_at,
            'closes_at': attendance_close_at,
            'seconds_until_open': 0,
        }

    return {
        'status': 'OPEN',
        'can_record': True,
        'message': 'Attendance can be recorded now and remains open for 24 hours from the class start time.',
        'opens_at': attendance_open_at,
        'closes_at': attendance_close_at,
        'seconds_until_open': 0,
    }
