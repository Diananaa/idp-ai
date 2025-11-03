import { NextResponse } from 'next/server'
import { initDB } from '@/lib/db'
import { AppDataSource } from '@/lib/data-source'
import { User } from '@/lib/entities/User'

export async function GET() {
  try {
    await initDB()
    const repo = AppDataSource.getRepository(User)
    const users = await repo.find()
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    await initDB()
    
    const body = await req.json()
    
    // Validasi input
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validasi format email sederhana
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const repo = AppDataSource.getRepository(User)
    const newUser = repo.create({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase()
    })
    
    const saved = await repo.save(newUser)
    return NextResponse.json(saved, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Handle duplicate email error
    if (error.code === '23505' || error.message?.includes('duplicate')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}
