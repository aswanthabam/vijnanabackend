from rest_framework.views import APIView
from rest_framework.response import Response
from . import user_serializer
from utils.utils import CustomResponce
class RegisterView(APIView):
  def post(self,request):
    print(request.data)
    try:
      res = user_serializer.UserSerializer(data=request.data)
      if res.is_valid():
        return CustomResponce('Successfully Registerd!').get_success_responce()
      else:
        return CustomResponce('Unable to complete request!',res.errors).get_failiure_responce()
    except Exception as e:
      print(e)