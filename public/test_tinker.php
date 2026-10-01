$u = App\Models\User::first();
if($u) {
    echo $u->rts()->toSql() . "\n";
    echo $u->rts()->where('rt.id', 1)->toSql() . "\n";
}
