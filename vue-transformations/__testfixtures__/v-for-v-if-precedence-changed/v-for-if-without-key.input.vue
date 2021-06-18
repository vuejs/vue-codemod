<template>
<ul>
<li
v-for='user in users'
v-if='user.isActive'
>
{{user.name}}
</li>
</ul>
</template>
