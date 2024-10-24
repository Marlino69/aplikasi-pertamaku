<script setup>
import { ref } from 'vue';
import CommentSection from './components/CommentSection.vue';

const userId = ref('');
const users = ref(null);
const newEmail = ref('');


const getUser = async () => {
  try {
    // Validasi apakah input userId adalah angka
    const userIdValue = userId.value.trim();
    if (!/^\d+$/.test(userIdValue)) {  // RegEx untuk memeriksa apakah hanya angka yang dimasukkan
      alert("Please enter a valid numeric user ID");
      return;
    }

    // Lakukan request ke API
    const response = await fetch(`http://localhost:3000/api/user/${encodeURIComponent(userIdValue)}`);
    
    // Cek apakah respon berhasil (status 200-299)
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    // Parse response JSON
    const data = await response.json();
    
    // Jika tidak ada user yang ditemukan (asumsikan API mengembalikan array)
    if (data.length === 0) {
      alert("No user found with the given ID");
      return;
    }

    // Assign data ke users.value
    users.value = data;

  } catch (error) {
    // Tangani error apa pun yang terjadi selama fetch atau pengolahan
    console.error("Error fetching user data:", error);
    alert("An error occurred while fetching the user data. Please try again later.");
  }
};



const changeEmail = async () => {
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.value);
  if (!validEmail) {
    alert("Please enter a valid email address.");
    return;
  }

  await fetch('http://localhost:3000/api/change-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `email=${encodeURIComponent(newEmail.value)}`,
  });
};

</script>

<template>
  <div id="app">
    <h1>User Dashboard</h1>
    <div>
      <input v-model="userId" placeholder="Enter User ID" />
      <button @click="getUser">Get User Info</button>
    </div>
    <div v-if="users">
      <template v-for="user in users">
        <h2>{{ user.name }}</h2>
        <p>Email: {{ user.email }}</p>
        <hr />
      </template>
    </div>
    <CommentSection />
    <form @submit.prevent="changeEmail">
      <h3>Change Email</h3>
      <input v-model="newEmail" placeholder="New Email" />
      <button type="submit">Submit</button>
    </form>
  </div>
</template>
