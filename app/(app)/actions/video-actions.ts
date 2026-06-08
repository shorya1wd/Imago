'use server'

import { revalidatePath } from 'next/cache';

export async function refreshVideoGallery() {
  revalidatePath('/home');
}