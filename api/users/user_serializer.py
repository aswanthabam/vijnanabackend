from rest_framework import serializers, validators
from rest_framework.fields import empty
from db.models import CustomUser
import uuid

class UserSerializer(serializers.Serializer):
  user_id = serializers.ReadOnlyField()
  first_name = serializers.CharField(required=True)
  second_name = serializers.CharField(required=True)
  email = serializers.CharField(required=True)#,validators=[validators.UniqueValidator(queryset=CustomUser.objects.all(),message="nonene")])
  phone = serializers.CharField(required=True)#,validators=[validators.UniqueValidator(queryset=CustomUser.objects.all(),message="dfdf")])
  college = serializers.CharField(required=True)
  course = serializers.CharField(required=True)
  year = serializers.IntegerField(required=True)
  password = serializers.CharField(required=False)
  is_google = serializers.BooleanField(required=True)
  
  # def validate_email(self,val):
  #   v = CustomUser.objects.filter(email=val)
  #   print(v)
  #   if v != None and len(v) > 0:
  #     raise serializers.ValidationError('This email is already registered')
  #   else:
  #     return val
  
  # def validate_phone(self,val):
  #   v = CustomUser.objects.filter(phone=val)
  #   if v != None and len(v) > 0:
  #     raise serializers.ValidationError('This phone number is already registerd')
  #   else:
  #     return val
  
  def run_validation(self, data=...):
    value = super().run_validation(data)
    print("HIIIIII")
    password = value.get('password')
    is_google = value.get('is_google')
    email = value.get('email')
    phone = value.get('phone')
    
    v = CustomUser.objects.filter(phone=phone)
    if v != None and len(v) > 0:
      raise serializers.ValidationError('This phone number is already registerd')
    
    v = CustomUser.objects.filter(email=email)
    if v != None and len(v) > 0:
      raise serializers.ValidationError('This email is already registerd')
    
    print(password,is_google)
    if(not is_google and password == None):
      raise serializers.ValidationError("Password can not be blank")
    return value
  
  def create(self,validated_data):
    validated_data['user_id'] = uuid.uuid4()
    user = CustomUser(**validated_data)
    user.save()
    return user
  
  class Meta:
    model = CustomUser
    fields = [
      'user_id',
      'first_name',
      'second_name',
      'email',
      'phone',
      'college',
      'course',
      'year',
      'password',
      'is_google'
    ]