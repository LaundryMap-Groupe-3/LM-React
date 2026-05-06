const DashboardHeader = ({
  containerClassName,
  titleClassName,
  title,
  subtitle,
  user,
  iconSrc,
  iconAlt,
  lastLoginLabel,
  showEmail = false,
  children,
}) => {
  return (
    <div className={`${containerClassName} bg-[#3B82F6] text-white flex flex-col items-center justify-center rounded-[10px] p-4 md:p-8 mb-6 text-center`}>
      <div className="flex flex-col items-center text-center">
        <h1 className={`text-[20px] font-bold mb-0 md:text-[28px] ${titleClassName}`}>
          {title}
        </h1>
        <p className="text-white text-[9px] mt-2 md:text-[13px]">{subtitle}</p>
      </div>
      <div className="bg-[#FFFFFF]/20 rounded-[10px] w-[282px] md:w-[350px] min-h-[57px] md:min-h-[120px] p-[9px] md:p-4 mt-4 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col items-center justify-center gap-[10px] md:gap-[2px] w-full h-full text-center">
          <img src={iconSrc} alt={iconAlt} className="mx-auto" />
          <div className="flex flex-col items-center justify-center text-center w-full h-full">
            {user && (
              <>
                <p className="text-white text-[12px] font-regular md:text-[15px] text-center">
                  {user.firstName} {user.lastName}
                </p>
                {showEmail && (
                  <p className="text-white text-[12px] md:text-[13px] text-center">
                    {user.email}
                  </p>
                )}
                {children}
              </>
            )}
            <p className="text-white text-[12px] md:text-[13px] text-center">
              {lastLoginLabel} {user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '--'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;