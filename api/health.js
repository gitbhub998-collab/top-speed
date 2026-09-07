export default function health(req, res) {
  res.status(200).json({ status: 'Backend is running' });
}
