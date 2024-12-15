from django.urls import path
from .views import generate_sheet

urlpatterns = [
    path("generate-sheet/", generate_sheet, name="generate_sheet"),
]

