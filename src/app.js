const express = require('express');
const mongoose = require('mongoose');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

mongoose.connect('mongodb+srv://deshrajjatt22:vFO5PUXLddhpgL44@cluster0.ogrvrsr.mongodb.net/?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.once('open', () => {
    console.log('Connected to the database');
    initializeVoteCounts();
});



// Define a schema for voter registration
const voterSchema = new mongoose.Schema({
    uniqueId: { type: String, unique: true }, // Unique ID for each voter
    name: String, // Name of the voter
    isVoted: Boolean // Boolean variable to track whether the voter has voted
});

const Voter = mongoose.model('Voter', voterSchema);

app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create a folder with the voter's uniqueId as the folder name
        const voterFolder = path.join('public','labeled_images', req.body.uniqueId);
        fs.mkdirSync(voterFolder, { recursive: true }); // Create the folder if it doesn't exist
        cb(null, voterFolder); // Store uploaded files in the voter's folder
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);

        // Check if the file extension is JPG (case-insensitive)
        if (ext.toLowerCase() === '.jpg') {
            // Use a counter to generate sequential file names
            const voterFolder = path.join('public', 'labeled_images', req.body.uniqueId);
            const files = fs.readdirSync(voterFolder);
            const sequentialNumber = files.length + 1;

            const fileName = `${sequentialNumber}${ext}`;
            cb(null, fileName); // Use the sequential file name
        } else {
            // Reject files with invalid extensions
            cb(new Error('Invalid file format. Only JPG files are allowed.'));
        }
    }
});

const upload = multer({ storage: storage });

// Create a voter registration route
app.post('/register', upload.array('photos', 5), async (req, res) => {
    const { uniqueId, name } = req.body;
    const voterFolder = path.join('labeled_images', uniqueId); // Get the voter's folder
    const photoPaths = req.files.map(file => path.join(voterFolder, file.filename));

    // Create a new voter record in the database
    const voter = new Voter({
        uniqueId,
        name,
        isVoted: false
    });

    try {
        await voter.save();
        res.status(201).json({ message: 'Voter registered successfully' });
    } catch (error) {
        console.error('Error registering voter:', error);
        res.status(500).json({ error: 'Error registering voter' });
    }
});


// ... (Previous code)

// Route to delete a user by uniqueId and delete their folder
// Route to delete a user by uniqueId and delete their folder
app.delete('/users/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;

    try {
        // Check if the user exists in the database
        const user = await Voter.findOne({ uniqueId });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Delete the user's folder with their photos
        const voterFolder = path.join('public', 'labeled_images', uniqueId);
        fs.rmSync(voterFolder, { recursive: true });

        // Delete the user from the database by uniqueId
        await Voter.deleteOne({ uniqueId });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});


// Route to get all users
app.get('/users', async (req, res) => {
    try {
        const users = await Voter.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// Route to update a user by uniqueId
app.put('/users/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;
    const { name, isVoted } = req.body;

    try {
        // Find the user by uniqueId
        const user = await Voter.findOne({ uniqueId });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user data
        user.name = name;
        user.isVoted = isVoted;

        // Save the updated user
        await user.save();

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
    }
});

app.get('/voter-exists/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;

    try {
        const voter = await Voter.findOne({ uniqueId });

        if (!voter) {
            res.json({ exists: false });
        } else {
            res.json({ exists: true });
        }
    } catch (error) {
        console.error('Error checking if voter exists:', error);
        res.status(500).json({ error: 'Error checking if voter exists' });
    }
});

app.get('/voter/:uniqueId/isVoted', async (req, res) => {
    const uniqueId = req.params.uniqueId;

    try {
        // Find the voter by uniqueId
        const voter = await Voter.findOne({ uniqueId });

        if (!voter) {
            return res.status(404).json({ error: 'Voter not found' });
        }

        // Return the isVoted value
        res.json({ isVoted: voter.isVoted });
    } catch (error) {
        console.error('Error fetching voter isVoted value:', error);
        res.status(500).json({ error: 'Error fetching voter isVoted value' });
    }
});

app.put('/voter/:uniqueId/isVoted', async (req, res) => {
    const uniqueId = req.params.uniqueId;
    const { isVoted } = req.body;

    try {
        // Find the voter by uniqueId
        const voter = await Voter.findOne({ uniqueId });

        if (!voter) {
            return res.status(404).json({ error: 'Voter not found' });
        }

        // Update the isVoted value
        voter.isVoted = isVoted;

        // Save the updated voter
        await voter.save();

        res.json({ message: 'Voter isVoted value updated successfully' });
    } catch (error) {
        console.error('Error updating voter isVoted value:', error);
        res.status(500).json({ error: 'Error updating voter isVoted value' });
    }
});















const voteCountSchema = new mongoose.Schema({
    partyA: Number,
    partyB: Number,

    partyC: Number
});

const VoteCount = mongoose.model('VoteCount', voteCountSchema);




let partyACount = 0;
 let partyBCount = 0;
 let partyCCount = 0;


 async function initializeVoteCounts() {
    try {
        const counts = await VoteCount.findOne();
        if (counts) {
            partyACount = counts.partyA;
            partyBCount = counts.partyB;
            partyCCount = counts.partyC;
        }
    } catch (error) {
        console.error('Error initializing vote counts:', error);
    }
}

// app.get('/vote/partyA', async (req, res) => {
//     console.log("33");
//     partyACount++;
//      console.log("33");
//     await updateVoteCounts();
//     res.redirect('/vote-successful');
// });
app.post('/vote/partyA', async (req, res) => {
    
    partyACount++;
    
    
    await updateVoteCounts();
   
    res.json({ partyA: partyACount, partyB: partyBCount, partyC: partyCCount });
});


app.post('/vote/partyB', async (req, res) => {
    partyBCount++;
    await updateVoteCounts();
    res.json({ partyA: partyACount, partyB: partyBCount, partyC: partyCCount });
});

app.post('/vote/partyC', async (req, res) => {
    partyCCount++;
    await updateVoteCounts();
    res.json({ partyA: partyACount, partyB: partyBCount, partyC: partyCCount });
});
app.get('/get-vote-counts', async (req, res) => {
    try {
        const counts = await VoteCount.findOne();
        res.json({
            partyA: counts.partyA,
            partyB: counts.partyB,
            partyC: counts.partyC
        });
    } catch (error) {
        console.error('Error fetching vote counts:', error);
        res.status(500).json({ error: 'Error fetching vote counts' });
    }
});


async function updateVoteCounts() {
    try {
        let counts = await VoteCount.findOne();
        
        if (!counts) {
            counts = new VoteCount({ partyA: 0, partyB: 0, partyC: 0 });
            console.log('not counts');

        }

        counts.partyA = partyACount;
        counts.partyB = partyBCount;
        counts.partyC = partyCCount;
        console.log('Updated counts:', counts);
        await counts.save();
    } catch (error) {
        console.error('Error updating vote counts:', error);
    }
}

app.get('/vote-successful', (req, res) => {
    res.send('Vote successful! Thank you for voting.');
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
