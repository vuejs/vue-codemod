<template>
<ul>
<template v-for='user in users' :key='user.id'>
<li

v-if='user.isActive'

>
{{user.name}}
</li>
</template>
</ul>
</template>
