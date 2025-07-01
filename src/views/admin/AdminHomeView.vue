<template>
  <div class="admin-home">
    <br><br><br><br><br><br><br>
    <div class="admin-menu">
      <router-link to="/admin/users" class="menu-card">
        <h2>유저 관리</h2><br><br><br>
        <p>회원 목록 조회, 회원 정보 수정/삭제</p>
      </router-link>
      <router-link to="/admin/posts" class="menu-card">
        <h2>게시글 관리</h2><br><br><br>
        <p>전체 게시글 조회, 게시글 수정/삭제</p>
      </router-link>
      <router-link to="/admin/comments" class="menu-card disabled">
        <h2>댓글 관리</h2><br><br><br>
        <p>곧 추가 예정</p>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.admin-home {
  padding: 20px;
  color: #333333;
}

.admin-home h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.admin-menu {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.menu-card {
  flex: 1 1 250px;
  background: #ffffff;
  color: #333333;
  padding: 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.menu-card h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 1.2rem;
}

.menu-card p {
  margin: 0;
  font-size: 0.95rem;
  color: #666666;
}

.menu-card.disabled {
  pointer-events: none;
  opacity: 0.5;
  background: #e5e5e5;
  color: #999999;
}
</style>
