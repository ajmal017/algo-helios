# Generated by Django 3.0.1 on 2020-02-03 06:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0009_auto_20200203_1037'),
    ]

    operations = [
        migrations.AddField(
            model_name='usergroup',
            name='multiplier',
            field=models.IntegerField(default=1),
        ),
    ]
