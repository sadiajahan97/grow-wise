from rest_framework import serializers
from apps.employees.models import Employee


class EmployeeProfileSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    designation_name = serializers.CharField(source='designation.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'staff_id',
            'name',
            'department_name',
            'designation_name',
            'last_visited_at',
        ]

