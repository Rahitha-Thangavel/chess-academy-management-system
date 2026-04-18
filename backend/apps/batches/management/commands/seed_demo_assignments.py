from itertools import cycle
from random import Random

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.batches.models import Batch, BatchEnrollment
from apps.students.models import Student
from apps.users.models import User


class Command(BaseCommand):
    help = 'Assign existing coaches and active students to active batches for demonstrations.'

    def add_arguments(self, parser):
        parser.add_argument('--students-per-batch', type=int, default=6)

    @transaction.atomic
    def handle(self, *args, **options):
        students_per_batch = max(1, options['students_per_batch'])
        rng = Random(42)

        active_batches = list(Batch.objects.filter(status=Batch.BatchStatus.ACTIVE).order_by('id'))
        coaches = list(User.objects.filter(role=User.Role.COACH, is_active=True).order_by('id'))
        students = list(Student.objects.filter(status=Student.Status.ACTIVE).order_by('id'))

        if not active_batches:
            self.stdout.write(self.style.WARNING('No active batches found.'))
            return
        if not coaches:
            self.stdout.write(self.style.WARNING('No active coaches found.'))
            return
        if not students:
            self.stdout.write(self.style.WARNING('No active students found.'))
            return

        coach_cycle = cycle(coaches)
        assigned_coaches = 0
        created_enrollments = 0

        student_pool = students[:]
        rng.shuffle(student_pool)
        student_cursor = 0

        for batch in active_batches:
            coach = next(coach_cycle)
            if batch.coach_user_id != coach.id:
                batch.coach_user = coach
                batch.save(update_fields=['coach_user'])
                assigned_coaches += 1

            assigned_to_batch = BatchEnrollment.objects.filter(batch=batch).count()
            remaining_capacity = max(batch.max_students - assigned_to_batch, 0)
            target_count = min(students_per_batch, remaining_capacity)

            added_for_batch = 0
            attempts = 0
            max_attempts = len(student_pool) * 2

            while added_for_batch < target_count and attempts < max_attempts:
                student = student_pool[student_cursor % len(student_pool)]
                student_cursor += 1
                attempts += 1

                if BatchEnrollment.objects.filter(student=student, batch=batch).exists():
                    continue
                if BatchEnrollment.objects.filter(student=student).count() >= 2:
                    continue

                BatchEnrollment.objects.create(student=student, batch=batch)
                created_enrollments += 1
                added_for_batch += 1

        self.stdout.write(
            self.style.SUCCESS(
                f'Updated {assigned_coaches} batch coach assignments and created {created_enrollments} enrollments.'
            )
        )
