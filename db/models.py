# from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models
import uuid
# from django.contrib.auth.models import AbstractUser
class CustomUser(models.Model):
  user_id = models.CharField(max_length=40,unique=True)
  
  first_name = models.CharField(max_length=50,blank=False,null=False)
  second_name = models.CharField(max_length=30,blank=False,null=False)
  
  email = models.EmailField(blank=False,null=False,unique=True)
  phone = models.CharField(max_length=14,unique=True,blank=False,null=False)

  college = models.CharField(max_length=100,blank=False,null=False)
  course = models.CharField(max_length=50,blank=False,null=False)
  year = models.IntegerField(blank=False, null=False)

  password = models.CharField(max_length=50,null=True,blank=False)
  is_google = models.BooleanField(default=True)

class Event(models.Model):
  event_id = models.CharField(max_length=36,unique=True,default=uuid.uuid4,editable=False)
  name = models.CharField(max_length=100,null=False,blank=False)
  description = models.TextField(blank=False,null=False)
  link = models.CharField(max_length=300,null=False,blank=False)
  img = models.CharField(null=False,blank=False,max_length=300)
  details = models.TextField(blank=False,null=False)
  documents = models.TextField(blank=False,null=False)