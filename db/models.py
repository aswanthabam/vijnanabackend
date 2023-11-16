from django.contrib.auth.base_user import AbstractBaseUser
from django.db import models

class CustomUser(AbstractBaseUser):
  user_id = models.CharField(max_length=40,unique=True)
  
  first_name = models.CharField(max_length=50,blank=False,null=False)
  last_name = models.CharField(max_length=30,blank=False,null=False)
  
  email = models.EmailField(blank=False,null=False,unique=True)
  phone = models.CharField(max_length=14,unique=True,blank=False,null=False)

  college = models.CharField(max_length=100,blank=False,null=False)
  course = models.CharField(max_length=50,blank=False,null=False)
  year = models.IntegerField(blank=False, null=False)

  EMAIL_FIELD = 'email'
  USERNAME_FIELD = 'user_id'