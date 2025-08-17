import { Injectable, inject } from '@angular/core';
import { supabase } from './supabase.client';
import { from } from 'rxjs';
import { Package } from './models';

@Injectable({ providedIn: 'root' })
export class PackagesService {
  list() {
    return from(supabase.from('packages').select('*').eq('active', true).order('created_at', { ascending: false }));
  }

  bySlug(slug: string) {
    return from(supabase.from('packages').select('*').eq('slug', slug).single());
  }
}
