from django.core.management.base import BaseCommand
from kria.models import User


class Command(BaseCommand):
    help = 'Create a test user for debugging'

    def add_arguments(self, parser):
        parser.add_argument('--email', type=str, default='test@example.com')
        parser.add_argument('--password', type=str, default='testpass123')
        parser.add_argument('--name', type=str, default='Test User')

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']
        name = options['name']

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                self.stdout.write(self.style.WARNING(f'User with email {email} already exists'))
                return

            # Create user
            user = User.objects.create_user(
                email=email,
                password=password,
                name=name,
                age=25,
                cycle_length=28
            )

            self.stdout.write(self.style.SUCCESS(f'Successfully created user: {email}'))
            self.stdout.write(f'Password: {password}')
            
            # Test authentication
            from django.contrib.auth import authenticate
            test_user = authenticate(email=email, password=password)
            if test_user:
                self.stdout.write(self.style.SUCCESS('✓ Authentication test passed!'))
            else:
                self.stdout.write(self.style.ERROR('✗ Authentication test failed!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error: {str(e)}'))
