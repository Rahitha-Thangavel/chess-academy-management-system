from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0003_salary_batch_salary_deductions_salary_gross_amount_and_more'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=120)),
                ('category', models.CharField(choices=[('RENT', 'Rent'), ('ELECTRICITY', 'Electricity / Current Bill'), ('CLEANING', 'Cleaning Salary'), ('MAINTENANCE', 'Maintenance'), ('INTERNET', 'Internet')], max_length=20)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('expense_date', models.DateField()),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='recorded_expenses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-expense_date', '-created_at'],
            },
        ),
    ]
