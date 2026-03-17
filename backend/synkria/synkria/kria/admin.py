from django.contrib import admin
from .models import User, CyclePrediction

class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'is_staff', 'is_active')
    search_fields = ('email', 'name')
    list_filter = ('is_staff', 'is_active')

admin.site.register(User, UserAdmin)
admin.site.register(CyclePrediction)
