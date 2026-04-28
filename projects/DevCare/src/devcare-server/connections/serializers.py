from rest_framework import serializers

class CreateJoinLinkSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=50, required=False, allow_blank=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
