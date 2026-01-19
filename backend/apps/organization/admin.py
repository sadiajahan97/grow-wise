from django.contrib import admin
from .models import Department, Designation, JobDescription, CareerPath

admin.site.register(Department)
admin.site.register(Designation)
admin.site.register(JobDescription)
admin.site.register(CareerPath)
