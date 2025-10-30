"""Alter User.email and User.phone_number to be unique.

Generated manually to reflect model changes.
"""

from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_govscheme'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True, unique=True, db_index=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='phone_number',
            field=models.CharField(max_length=15, unique=True, db_index=True),
        ),
    ]
