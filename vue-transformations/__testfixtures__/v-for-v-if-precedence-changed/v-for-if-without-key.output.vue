<template>
<ul>
<template v-for='user in users'>
<li

v-if='user.isActive'
>
{{user.name}}
</li>
</template>
</ul>
</template>
