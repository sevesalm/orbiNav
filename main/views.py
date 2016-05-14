from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .solver import *

def index(request):
	return render(request, 'index.html', {})

def about(request):
	return render(request, 'about.html', {})

@csrf_exempt
def generate(request):
	solver = Solver("data.txt")
	result_euc = solver.solve(True)
	result_hops = solver.solve(False)
	points = []

	for item in solver.points:
		coords = [item.x, item.y, item.z]
		points.append(coords)

	result = {}
	result["seed"] = str(solver.seed)
	result["euc"] = result_euc
	result["hops"] = result_hops
	result["points"] = points
	return JsonResponse(result)

