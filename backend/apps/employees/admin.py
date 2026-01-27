from django.contrib import admin
from .models import Employee, Profession


@admin.register(Profession)
class ProfessionAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at', 'updated_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')


admin.site.register(Employee)
