// Check Database Contents - Users and Knowledge Base
const { MongoClient } = require('mongodb')

async function checkDatabase() {
  try {
    console.log('🔍 Checking Database Contents...')
    
    const uri = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster0.wl38n.mongodb.net/genedu'
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(process.env.MONGODB_DB || 'genedu')
    
    // Check Users Collection
    console.log('\n👥 USERS COLLECTION:')
    const usersCollection = db.collection('users')
    const userCount = await usersCollection.countDocuments()
    console.log(`Total users: ${userCount}`)
    
    if (userCount > 0) {
      const sampleUsers = await usersCollection.find({}).limit(3).toArray()
      sampleUsers.forEach((user, index) => {
        console.log(`\n--- User ${index + 1} ---`)
        console.log('User ID:', user.userId)
        console.log('Name:', user.name)
        console.log('Email:', user.email)
        console.log('Role:', user.role)
        console.log('Verified:', user.isVerified)
        console.log('Created:', user.createdAt)
        console.log('Last Login:', user.lastLogin)
      })
    } else {
      console.log('No users found in database')
    }
    
    // Check Knowledge Base Collection
    console.log('\n📚 KNOWLEDGE BASE COLLECTION:')
    const knowledgeCollection = db.collection('knowledgebases')
    const knowledgeCount = await knowledgeCollection.countDocuments()
    console.log(`Total knowledge entries: ${knowledgeCount}`)
    
    if (knowledgeCount > 0) {
      const sampleKnowledge = await knowledgeCollection.find({}).limit(3).toArray()
      sampleKnowledge.forEach((entry, index) => {
        console.log(`\n--- Knowledge Entry ${index + 1} ---`)
        console.log('ID:', entry._id.toString())
        console.log('Title:', entry.title)
        console.log('Category:', entry.category)
        console.log('Content length:', entry.text?.length || 0)
        console.log('Tags:', entry.tags)
        console.log('Source:', entry.metadata?.source)
        console.log('Created:', entry.metadata?.createdAt)
        console.log('Has embedding:', !!entry.embedding)
      })
    } else {
      console.log('No knowledge entries found in database')
    }
    
    await client.close()
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkDatabase()
