from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import urllib.request
import math
import sys
import json

# Global (no pun intended) constants
EARTH_RADIUS = 6371000
EARTH_RADIUS2 = EARTH_RADIUS*EARTH_RADIUS

# All calculations are done in Cartesian
def polar_to_cartesian(lat, lon, alt):
	latitude = math.radians(lat)
	longitude = math.radians(lon)
	R = alt + EARTH_RADIUS

	x = R * math.cos(latitude) * math.cos(longitude)
	y = R * math.cos(latitude) * math.sin(longitude)
	z = R * math.sin(latitude)
	return Point(x, y, z)

# Let's keep thins clean and have a separate class for vectors
class Vector:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

	def dot(self, vector):
		return self.x*vector.x + self.y*vector.y + self.z*vector.z

	def unit(self):
		length_inv = 1.0/math.sqrt(self.x*self.x + self.y*self.y + self.z*self.z)
		return Vector(self.x*length_inv, self.y*length_inv, self.z*length_inv)

# Used to store info for both satellites and stard/destination points
class Point:
	def __init__(self, x, y, z):
		self.x = x
		self.y = y
		self.z = z

	def distance_to(self, point):
		diff_x = point.x - self.x
		diff_y = point.y - self.y
		diff_z = point.z - self.z
		return math.sqrt(diff_x*diff_x + diff_y*diff_y + diff_z*diff_z)

	# Uses basic ray -> sphere intersection routine with some minor optimizations
	# See: http://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-sphere-intersection
	def can_see(self, point):
		r_origin = Vector(-self.x, -self.y, -self.z)
		D = Vector(point.x-self.x, point.y-self.y, point.z-self.z).unit()

		tc = r_origin.dot(D)
		if tc < 0:
			return True
		else:
			d2 = r_origin.dot(r_origin) - tc*tc
			if d2 > EARTH_RADIUS2:
				return True
			return False

	# For debugging
	# def __str__(self):
	# 	return(str(self.x) + "," + str(self.y) + "," + str(self.z))

# Node class for priority queue
class Node:
	def __init__(self, index, distance):
		self.index = index
		self.priority = distance

	def __lt__(self, other):
		return self.priority < other.priority

class Solver:
	# Parses input data: converts polar->cartesian and stores all points
	def __init__(self, filename):
		self.points = []
		#with open(filename, 'r') as f:
		with urllib.request.urlopen('https://space-fast-track.herokuapp.com/generate') as f:
			self.seed = f.readline().decode('utf-8').split()[-1]
			for line in f:
				items = line.decode('utf-8').split(",")
				identifier = items[0]
				if identifier[:3] == "SAT":
					self.points.append(polar_to_cartesian(float(items[1]), float(items[2]), 1000*float(items[3])))
				elif identifier == "ROUTE":
					self.points.insert(0, polar_to_cartesian(float(items[1]), float(items[2]), 1))
					self.points.insert(1, polar_to_cartesian(float(items[3]), float(items[4]), 1))
				else:
					print("Error:", identifier)
		self.count = len(self.points)
		self.calc_dist()

	# Pre-calc distance matrix for all nodes - using symmetry optimization
	def calc_dist(self):
		self.dist_matrix = [None] * (self.count*self.count)
		self.graph = []
		for i in range(self.count):
			row = [0] * self.count
			for j in range(i+1, self.count):
				p1 = self.points[i]
				p2 = self.points[j]
				if p1.can_see(p2):
					dist = p1.distance_to(p2)
					self.dist_matrix[i*self.count + j] = self.dist_matrix[i + j*self.count] = dist
					row[j] = 1
			self.graph.append(row)

		# for i in range(self.count):
		# 	print(i, end=": ")
		# 	for j in range(self.count):
		# 		print('%.2E' % self.dist_matrix[i*self.count + j], end=" ")
		# 	print("")


	# Using Dijkstra algorithm for finding the shortest route
	# Uses simple priority queue for storing unvisited nodes
	# (More robust way is to extend Python's PriorityQueue)
	# dist - stores cumulative distance to point i
	# prev - stores parent point for point i
	# euclidean - True-shortest euclidean distance, False-least number of hops
	def solve(self, euclidean):
		priority_q = []
		dist = [sys.float_info.max] * self.count
		prev = [None] * self.count
		dist[0] = 0.0
		for i in range(self.count):
			priority_q.append(Node(i, dist[i]))

		while len(priority_q):
			node = priority_q.pop(priority_q.index(min(priority_q)))
			index = node.index
			if index == 1:
				break	# Reached destination
			distance = node.priority
			for i in range(self.count):
				edge_w = self.dist_matrix[index*self.count + i]
				if not edge_w:
					continue
				if euclidean:
					new_dist = edge_w + distance
				else:
					new_dist = 1 + distance
				if  new_dist < dist[i]:
					dist[i] = new_dist
					prev[i] = index

					for item in priority_q:
						if item.index == i:
							item.priority = new_dist
							break

		# Traverse solution reversed, start from destination node (i=1)
		i = 1
		solution = []
		distance = 0.0
		while prev[i]:
			solution.insert(0, prev[i]-2)
			distance += self.dist_matrix[i*self.count + prev[i]]
			i = prev[i]

		if len(solution):
			hops = len(solution)+1
		else:
			hops = 0

		return {'solution': solution, 'distance': distance, 'hops': hops}

def index(request):
	return render(request, 'index.html', {})

@csrf_exempt
def generate(request):
	solver = Solver("data.txt")
	resultA = solver.solve(True)
	resultB = solver.solve(False)
	points = []

	for item in solver.points:
		coords = [item.x, item.y, item.z]
		points.append(coords)

	result = {}
	result["seed"] = str(solver.seed)
	result["euc"] = resultA
	result["hops"] = resultB
	result["points"] = points
	result["graph"] = solver.graph
	return JsonResponse(result)

