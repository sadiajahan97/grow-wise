from rest_framework import serializers
from apps.certifications.models import Certification


class CertificationSerializer(serializers.ModelSerializer):
    employee_email = serializers.CharField(source='employee.email', read_only=True)

    class Meta:
        model = Certification
        fields = [
            'id',
            'employee_email',
            'link',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'employee_email', 'created_at', 'updated_at']


class CertificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['link']

