# Generated by Django 3.0.3 on 2020-02-25 06:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('subscriptions', '0005_order_user_group_id'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='order',
            unique_together={('razorpay_order_id',)},
        ),
    ]
