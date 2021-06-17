<template>
<ul>
<li
v-for='user in users'
v-if='user.isActive'
:key='user.id'
>
{{user.name}}
</li>
</ul>
</template>
