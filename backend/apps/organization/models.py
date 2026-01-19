from django.db import models

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class Designation(models.Model):
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("name", "department")

    def __str__(self):
        return f"{self.name} ({self.department.name})"


class JobDescription(models.Model):
    designation = models.ForeignKey(Designation, on_delete=models.CASCADE)
    job_description = models.TextField()

    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.designation} v{self.version}"


class CareerPath(models.Model):
    from_designation = models.ForeignKey(
        Designation, related_name="from_roles", on_delete=models.CASCADE
    )
    to_designation = models.ForeignKey(
        Designation, related_name="to_roles", on_delete=models.CASCADE
    )
