from datetime import time

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tournaments', '0004_tournamentregistration_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='tournament',
            name='end_time',
            field=models.TimeField(default=time(17, 0)),
        ),
        migrations.AddField(
            model_name='tournament',
            name='start_time',
            field=models.TimeField(default=time(9, 0)),
        ),
    ]
