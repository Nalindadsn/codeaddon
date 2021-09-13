import mongoose from 'mongoose'

const playlistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)
const Playlist =
  mongoose.models.Playlist || mongoose.model('Playlist', playlistSchema)
export default Playlist
