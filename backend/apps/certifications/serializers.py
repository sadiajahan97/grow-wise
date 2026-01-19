from rest_framework import serializers
from apps.certifications.models import Certification


class CertificationSerializer(serializers.ModelSerializer):
    staff_id = serializers.CharField(source='employee.staff_id', read_only=True)

    class Meta:
        model = Certification
        fields = [
            'id',
            'staff_id',
            'link',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'staff_id', 'created_at', 'updated_at']


class CertificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ['link']

