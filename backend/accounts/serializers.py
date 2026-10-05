from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'phone', 'password', 'confirm_password')
        extra_kwargs = {
            'full_name': {'required': True, 'allow_blank': False},
            'email': {'required': True, 'allow_blank': False},
            'phone': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return value

    def validate(self, attrs):
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')

        if password != confirm_password:
            raise serializers.ValidationError(
                {'confirm_password': 'Passwords do not match.'}
            )

        # Validate against Django's AUTH_PASSWORD_VALIDATORS
        # using the submitted user attributes (similarity checks).
        temp_user = User(
            full_name=attrs.get('full_name', ''),
            email=attrs.get('email', ''),
        )
        try:
            validate_password(password, user=temp_user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})

        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone = validated_data.get('phone') or None
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data['full_name'],
            phone=phone,
        )


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs['email'].strip()
        password = attrs['password']

        user = User.objects.filter(email__iexact=email).first()
        if user is None or not user.check_password(password):
            raise AuthenticationFailed('Invalid email or password.')
        if not user.is_active:
            raise AuthenticationFailed('User account is disabled.')

        attrs['user'] = user
        return attrs


class ProfileSerializer(serializers.ModelSerializer):
    """Basic profile of the CURRENT user (never another account).

    Updated with PATCH /api/auth/profile/ — always bound to
    ``serializer.instance`` (= ``request.user``), so a user ID sent by
    the client can never target someone else's record.
    """

    email = serializers.EmailField()

    class Meta:
        model = User
        fields = (
            'id',
            'full_name',
            'email',
            'phone',
            'date_of_birth',
            'gender',
            'about_me',
            'avatar',
        )
        read_only_fields = ('id',)

    def validate_email(self, value):
        value = value.strip().lower()
        queryset = User.objects.filter(email__iexact=value)
        if self.instance is not None:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(
                'An account with this email already exists.'
            )
        return value
