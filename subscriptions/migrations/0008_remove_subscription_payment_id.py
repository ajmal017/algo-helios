# Generated by Django 3.0.3 on 2020-02-28 04:58

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0007_auto_20200228_1026'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='subscription',
            name='payment_id',
        ),
    ]
