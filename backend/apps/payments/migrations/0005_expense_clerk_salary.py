from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('payments', '0004_expense'),
    ]

    operations = [
        migrations.AlterField(
            model_name='expense',
            name='category',
            field=models.CharField(choices=[
                ('RENT', 'Rent'),
                ('ELECTRICITY', 'Electricity / Current Bill'),
                ('CLEANING', 'Cleaning Salary'),
                ('CLERK_SALARY', 'Clerk Salary'),
                ('MAINTENANCE', 'Maintenance'),
                ('INTERNET', 'Internet'),
                ('TOURNAMENT_PRIZES', 'Tournament Gifts / Prizes'),
            ], max_length=20),
        ),
    ]
