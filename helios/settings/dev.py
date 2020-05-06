import sys
import asyncio

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())



from .common import *
from razorpay import Client
import django
from django.utils.log import DEFAULT_LOGGING

"""
Razorpay Variable and Declaration
"""
RAZORPAY_KEY = "rzp_test_mORiHoyolnJdWj"

client = Client(auth=(RAZORPAY_KEY, "1HoPO6AkWpoZC5NG3vgN83zp"))



"""
Allowed Host for sites
"""
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
]

"""
Local database credentials
"""
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'algonauts',
        'USER': 'algonauts',
        'PASSWORD': 'algonauts@123',
        'HOST': 'localhost',
        'PORT': '5432',
    },
    'janus' : {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'janusdb',
        'USER': 'algonauts',
        'PASSWORD': 'algonauts@123',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file_1': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
        },
        'file_2': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'worker.log',
        },
        'file_3': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'normal.log',
        },
        
    },
    'loggers': {
        'django': {
            'handlers': ['file_1'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'normal': {
            'handlers': ['file_3'],
            'level': 'DEBUG',
            'propagate': True,
        },
        'worker': {
            'handlers': ['file_2'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}

DEFAULT_LOGGING['loggers'][''] = {
    'handlers': ['console'],
    'level': 'DEBUG',
    'propagate': True
}

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [(os.environ.get('REDIS_ADDRESS', '127.0.0.1'), os.environ.get('REDIS_PORT', 6379))],
            "capacity":1000, 
            "expiry": 60,
        },
    },
}

CRONJOBS = [
    ('*/1 * * * *', 'subscriptions.cron.check_data_consistency', '>> worker.log')
]

CRONTAB_COMMAND_SUFFIX = '2>&1'