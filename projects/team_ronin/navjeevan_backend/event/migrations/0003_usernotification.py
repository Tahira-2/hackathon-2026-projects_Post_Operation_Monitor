from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('event', '0002_vaccination_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserNotification',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('PROGRAM', 'PROGRAM'), ('VACCINATION', 'VACCINATION'), ('PROFILE', 'PROFILE'), ('ACCOUNT', 'ACCOUNT')], default='PROGRAM', max_length=30)),
                ('title', models.CharField(max_length=120)),
                ('message', models.TextField(max_length=500)),
                ('is_read', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('event', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='event.event', verbose_name='Event')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='user.normaluser', verbose_name='User')),
            ],
            options={
                'verbose_name': 'User Notification',
                'ordering': ['-created_at'],
            },
        ),
    ]
