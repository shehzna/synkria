from django.shortcuts import render,redirect
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from .models import *

def home(request):
    return render(request, 'index.html')

def signin(request):
    if request.method == "POST":
        email = request.POST.get('email')
        password = request.POST.get('password')
        print(email, password)

        user = authenticate(email=email, password=password)
        if user is not None:
            login(request, user)
            return redirect('home')
    return render(request, 'login.html')

from django.contrib.auth.hashers import make_password

# from django.contrib.auth.hashers import make_password

def register(request):
    if request.method == "POST":
        profile = request.FILES.get('profile')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        result = User.objects.create(profile=profile, fullname=username, email=email, password=make_password(password))
        result.save()
        return redirect('login')
    return render(request, 'register.html')



def signout(request):
    logout(request)
    messages.success(request, "You have been logged out.")
    return redirect('home')
    
