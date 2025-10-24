<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware pour limiter le taux de requêtes API
 */
class ApiRateLimiter
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limit = '60'): Response
    {
        $key = $request->user() 
            ? 'api:' . $request->user()->id 
            : 'api:' . $request->ip();

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            return response()->json([
                'message' => 'Trop de requêtes. Veuillez réessayer dans ' . 
                    RateLimiter::availableIn($key) . ' secondes.',
            ], 429);
        }

        RateLimiter::hit($key, 60); // 60 secondes

        $response = $next($request);

        $response->headers->set('X-RateLimit-Limit', $limit);
        $response->headers->set('X-RateLimit-Remaining', RateLimiter::remaining($key, $limit));

        return $response;
    }
}
