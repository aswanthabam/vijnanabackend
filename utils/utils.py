from rest_framework.response import Response

class CustomResponce:
    out = {
        'status':'success'
    }

    def __init__(self,message:str=None,data : dict=None):
        if message == None and data == None:
            raise ValueError("Not passed either message or data")
        if message != None:
            self.out['message'] = message
        if data != None:
            self.out['data'] = data
    def get_success_responce(self,status:int = 200) -> Response:
        return Response(self.out,status)
    def get_failiure_responce(self,status:int = 400) -> Response:
        return Response(self.out,status)