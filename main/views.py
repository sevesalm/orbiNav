from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .solver import *

def index(request):
	return render(request, 'index.html', {})

def about(request):
	return render(request, 'about.html', {})

# View for AJAX requests. Fetches the problem, solves it and returns the result as JSON
@csrf_exempt
def generate(request):
	solver = Solver()

	result = {
		'seed': 	solver.seed,
		'euc':		solver.solve(True),
		'hops':		solver.solve(False),
		'points':	solver.get_points()
	}

	return JsonResponse(result)
