<template>
  <div class="min-h-screen bg-gradient-to-br from-neutral via-white to-primary-light flex items-center justify-center px-4">
    <div class="text-center">
      <div class="text-8xl mb-6">404</div>
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Страница не найдена</h1>
      <p class="text-xl text-neutral-darker mb-8">
        К сожалению, запрошенная страница не существует или была удалена.
      </p>

      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <RouterLink
          to="/dashboard"
          class="btn-primary"
        >
          На главную
        </RouterLink>
        <button
          @click="$router.back()"
          class="btn-secondary"
        >
          Вернуться назад
        </button>
      </div>

      <div class="mt-12 text-6xl">🔍</div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Component for handling 404 Not Found pages
</script>
