# Generated migration to add missing GopinathApplication fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0012_gopinathapplication'),
    ]

    operations = [
        migrations.AddField(
            model_name='gopinathapplication',
            name='college_contact',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='permanent_address',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='residence_proof_attached',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='current_meal_location',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='why_need',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='near_canteen',
            field=models.CharField(blank=True, max_length=10),
        ),
        migrations.AddField(
            model_name='gopinathapplication',
            name='expected_canteen_location',
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
