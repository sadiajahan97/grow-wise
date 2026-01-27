from rest_framework import serializers
from apps.employees.models import Employee, Profession


class ProfessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profession
        fields = [
            'id',
            'name',
            'created_at',
            'updated_at',
        ]


class EmployeeProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = [
            'email',
            'name',
            'last_visited_at',
        ]

