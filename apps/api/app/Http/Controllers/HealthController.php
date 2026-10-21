<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;

class HealthController extends Controller
{
    public function index(): View
    {
        return view('health');
    }
}
