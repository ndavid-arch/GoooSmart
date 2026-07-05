from django.db import models


class Stop(models.Model):
    stop_name = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)

    def __str__(self):
        return self.stop_name


class Route(models.Model):
    route_name = models.CharField(max_length=100)
    start_point = models.CharField(max_length=100)
    end_point = models.CharField(max_length=100)
    stops = models.ManyToManyField(Stop, through='RouteStop', related_name='routes')

    def __str__(self):
        return self.route_name


class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='route_stops')
    stop = models.ForeignKey(Stop, on_delete=models.CASCADE, related_name='stop_routes')
    stop_order = models.PositiveIntegerField()  # 1, 2, 3... position along the route

    class Meta:
        ordering = ['stop_order']
        unique_together = ('route', 'stop_order')  # no two stops share a position on the same route

    def __str__(self):
        return f"{self.route.route_name} - #{self.stop_order}: {self.stop.stop_name}"